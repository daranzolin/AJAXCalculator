#Script to generate random lender json data

library(zipcode)
library(jsonlite)
library(tidyverse)

tibble(
  name = sprintf("Lending Company %s", 1:100),
  url = "http://www.google.com",
  zipcode = sample(unique(zipcode$zip), 100)
) %>% toJSON()
write_json("lenders.json")
