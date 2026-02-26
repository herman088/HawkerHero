# HawkerHero
HawkerHero is a hawker food discovery engine that lets users search by dish, with over ** 6000** most relevant scraped reviews for over **60 ** hawkers as its data. \
Instead of relying on static stall listings, HawkerHero **aggregates and analyzes** thousands of reviews, extracting dish-level sentiment and popularity so users can find the best laksa, char kway teow, or chicken rice anywhere in Singapore.


## Tech Stack 
                
+ Back-End
    + FastAPI
+ Aspect Based Sentiment Analysis Model
    + PyABSA
+ Database, aggregations and ranking
    + ElasticSearch
+ Front-End
    * HTML
    * CSS
    * JS
+ Scraping of data
    + Apify Google Maps Scraper
 
## How it was built
   + About 100 most relevant reviews of each 60+ Hawker centre's information is scraped with ** Apify Google Maps Scraper** , a JSON file is output, returning over 6000+ review's information such as rating, review text etc.
   ``` Sample JSON Object
   {
        "title": "Amoy Street Food Centre",
        "reviewerId": "107847450021351030886",
        "reviewerUrl": "https://www.google.com/maps/contrib/107847450021351030886?hl=en",
        "name": "Jia Pin Lee",
        "reviewerNumberOfReviews": 871,
        "isLocalGuide": true,
        "reviewerPhotoUrl": "https://lh3.googleusercontent.com/a-/ALV-UjV2kiTzpebKwh5orpcA7XdN2qPxaAa9LarB45zR_ig3mymPvaHD=s1920-c-rp-mo-ba7-br100",
        "text": "There are plenty of food choices here. Although there were many seats, it was easily crowded during lunchtime. Might want to try your luck upstairs.\n\nTried the beef noodle here. It was quite good. The beef was delicious, with different variations and parts. Noodle was OK. It was a bit too wet, though, for a dry noodle.\n\nPrices were slightly above average compared to other food court.",
        "textTranslated": null,
        "publishAt": "9 months ago",
        "publishedAtDate": "2025-02-27T08:43:05.271Z",
        "likesCount": 1,
        "reviewId": "ChZDSUhNMG9nS0VJQ0FnTURnczc2UU5BEAE",
        "reviewUrl": "https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sChZDSUhNMG9nS0VJQ0FnTURnczc2UU5BEAE!2m1!1s0x0:0xc4c74da290ec162f!3m1!1s2@1:CIHM0ogKEICAgMDgs76QNA%7CCgwImcuAvgYQoJHMgQE%7C?hl=en",
        "reviewOrigin": "Google",
        "stars": 3,
        "rating": null,
        "responseFromOwnerDate": null,
        "responseFromOwnerText": null,
        "reviewImageUrls": [
          "https://lh3.googleusercontent.com/geougc-cs/AMBA38t8ZwOcLyiqiX7pryaoaOJnJhgqeIARu6wl_Ae1lh_GfbCDmYHO0IoPO243i7bnBnQBeN2j049g9WRY9vtD_hEz_H3LGj-1ywIKx7FIiHHlQNETPN3BBoH2iWoWATA6nDwALNtj",
          "https://lh3.googleusercontent.com/geougc-cs/AMBA38sttqVedF4Q-rFyxTFJAY4i-W83HTn_HHaGkBuxRefVO6tN2rbLIUcHYayPYZp-g6wKvIZpnBf29J2HXCKqWB62hNbtUfMdWYSgvSL91vAyCoD6oQ3PtehaddsB5VGF5LVMO_zu"
        ],
        "reviewContext": {
          "Service": "Dine in",
          "Meal type": "Lunch",
          "Price per person": "$1–10"
        },
        "reviewDetailedRating": {
          "Food": 3,
          "Service": 3,
          "Atmosphere": 3
        },
        "visitedIn": null,
        "originalLanguage": "en",
        "translatedLanguage": null
  }

   ```
  + Used an Aspect Based Sentiment Model to run on review texts, this extracts the "aspect","sentiment","confidence","probability" of the review text and then added to JSON object.
    ```Sample return
     "absa": [
      {
        "aspect": "fruit cake",
        "sentiment": "Positive",
        "confidence": 0.9995,
        "probs": [
          0.0002367699780734256,
          0.0002480022085364908,
          0.9995152950286865
        ]
      },
      {
        "aspect": "flavour",
        "sentiment": "Positive",
        "confidence": 0.9992,
        "probs": [
          0.00036933875526301563,
          0.0003876440750900656,
          0.9992430210113525
        ]
      }
    ]
    ```
 + JSON data indexxed to ElasticSearch, use strict ElasticSearch mapping rules to ensure data consistency & integrity. Similar to data types for a programming language.
  ```
  mapping = {
    "settings": {
        "analysis": {
            "analyzer": {
                "folding_analyzer": {
                    "tokenizer": "standard",
                    "filter": ["lowercase", "asciifolding"]
                }
            },
            "normalizer": {
                "lowercase_normalizer": {
                    "type": "custom",
                    "filter": ["lowercase","asciifolding"]
                }
            }
        }
    },
    "mappings":{
        "properties":{
            "hawker_name":{
                "type": "text",
                "analyzer": "folding_analyzer",
                "fields": {
                    "keyword": {"type": "keyword",
                                "normalizer":"lowercase_normalizer"
                            }
                        }
            },
            "hawker_id": {
            "type": "keyword"
            },
            "location": {
                "type": "geo_point"
            },
            "review_text": {
                "type": "text",
                "analyzer": "english"
            },
            "review_rating": {"type": "integer"},
            "review_author": {"type": "keyword"},
            "review_date": {"type": "date"},

            "food_rating": {"type": "integer"},
            "service_rating": {"type": "integer"},
            "atmosphere_rating": {"type": "integer"},
             

            "review_context": {"type": "flattened"},

            "context_wait_min": { "type": "integer" },
            "context_wait_max": { "type": "integer" },
            "context_price_min": { "type": "integer" },
            "context_price_max": { "type": "integer" }, 
            "context_parking_space": { "type": "keyword" },

            "context_recommended": {
               "type": "text",
               "analyzer": "folding_analyzer",
               "fields": {
                "raw": { "type": "keyword",
                        "normalizer": "lowercase_normalizer"
                    }
                }
            },

              "context_meal_type": { "type": "keyword" },
              "absa": {
                "type": "nested",
                "properties": {
                "aspect": { "type": "keyword" },
                "sentiment": { "type": "keyword" },
                "confidence": { "type": "float" },
                "probs": { "type": "float" }
                }
            }

         }
    }
}
  ```

   + Use ElasticSearch aggregations and queries to retrieve and rank relevant Hawkers based on user's search term.
  ## Features
  - Dish Search (Term or Phrase)
  - Fuzzy Search & Term Suggester(Looking to implement Phrase Suggester in future)
  - Direct Hawker Centre name search
    

## Demo Video
[Watch here](https://youtu.be/pYSYPNZMPWs)
