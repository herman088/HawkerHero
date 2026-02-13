from fastapi import FastAPI,Query 
from fastapi.staticfiles import StaticFiles
from elasticsearch import Elasticsearch,helpers
from fastapi.responses import FileResponse
import json
import math

app = FastAPI()

app.mount("/static", StaticFiles(directory="static", html=True), name="static")

@app.get("/")
def home():
    return FileResponse("static/index.html")

es = Elasticsearch(['http://localhost:9200'], basic_auth=("elastic", "5vRl7G_wpBvo8CytUL=h")) 

INDEX = "hawker_reviews"

def normalize_query(q):
    return q.lower().strip()

def build_query(dish):
    return {
        "size": 0,
        "query": { #Use the query parameter to limit the documents on which an aggregation runs:
            "bool": {
                "should": [
                    {
                        "match": {
                            "review_text": {
                                "query": dish,
                                "boost": 1.0
                            }
                        }
                    },
                    {
                        "match": {
                            "context_recommended": {
                                "query": dish,
                                "boost": 2.0
                            }
                        }
                    },
                    {
                        "nested": {
                            "path": "absa",
                            "query": {
                                "bool": {
                                    "must": [
                                        {"term": {"absa.sentiment": "Positive"}},
                                        {
                                            "wildcard": {
                                            "absa.aspect": {
                                                "value": "*chicken*rice*"
                                            }
                                         }
                                        }
                                    ]
                                }
                            },
                            "score_mode": "sum",
                            "boost": 3.0
                        }
                    }
                ]
            }
        },
        "aggs": { #sub-aggregations
            "by_hawker": {
                "terms": {
                    "field": "hawker_name.keyword",
                    "size": 100
                },
                "aggs": {
                    "food_mentions": {
                        "nested": {
                            "path": "absa"
                        },
                        "aggs": {
                            "positive_food": {
                                "filter": {
                                    "bool": {
                                        "must": [
                                            {"term": {"absa.sentiment": "Positive"}},
                                            {
                                                "wildcard": {
                                                    "absa.aspect": {
                                                        "value": "*chicken*rice*"
                                                }
                                              }
                                            }
                                        ]
                                    }
                                },
                                "aggs": {
                                    "confidence_sum": {
                                        "sum": {
                                            "field": "absa.confidence"
                                        }
                                    },
                                    "mention_count": {
                                        "value_count": {
                                            "field": "absa.aspect"
                                        }
                                    }
                                }
                            }
                        }
                    },
                          "recommended_food": {
                            "filter": {
                                "match": {
                                "context_recommended": {
                                    "query": "chicken rice"
                                }
                                }
                            }
                     }
                    
                }
            }
        }
    }




with open("hawker_deets.json","r",encoding="utf-8") as f:
    HAWKERS = json.load(f)
   
HAWKERS_BY_NAME = {
    h["title"].strip().lower(): h
    for h in HAWKERS
}


@app.get("/search")
def search(dish: str = Query(...),page:int=Query(1,ge=1),limit:int = Query(10,ge=1)):
    dish = normalize_query(dish)
    query = build_query(dish)

    res = es.search(index=INDEX,body=query)

    hawkers = []

    for h in res["aggregations"]["by_hawker"]["buckets"]:
        #reviews mentions
        counts = h["doc_count"]
        hawker_name = h["key"].strip()
        normalized_name = hawker_name.lower()


        absa = h["food_mentions"]["positive_food"]
        positive_count = absa["doc_count"]
        confidence_sum  = absa["confidence_sum"]["value"]

        rec = h["recommended_food"]
        recommended_count = rec["doc_count"]


        score = ( positive_count * 1.0 + confidence_sum * 2.0 + recommended_count * 0.8)
        

        meta = HAWKERS_BY_NAME.get(normalized_name,{})
        
        if meta:
            img = meta.get("media", [None])[0]
            rating = meta.get("rating")
            desc = meta.get("desc")
        
        hawkers.append({"hawker":h["key"],
                       "score":score,
                       "positive_mentions":positive_count,
                       "confidence":confidence_sum,
                       "recommended_mentions":recommended_count,
                        "mentions":counts,
                        "thumbnail": img,
                        "rating":rating,
                        "desc":desc}) 
        
        
      
        
    hawkers.sort(key=lambda x: x["score"], reverse=True)
    
    total = len(hawkers)
    total_pages = math.ceil(total/limit)
    start = (page - 1)* limit
    end = start + limit

    paginated = hawkers[start:end]


    return {
        "query":dish,
        "page":page,
        "limit":limit,
        "total":total,
        "total_pages":total_pages,
        "results":paginated
    }
        









        