import requests, json, random, time, threading
from flask import Flask, render_template, request, redirect
from apify_client import ApifyClient

app = Flask(__name__, template_folder='frontend')

@app.route("/")
def render_map():
  return render_template("map.html")


month_list = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

def get_change(month, data):
  month1 = []
  month2 = []
  if month == "Dec":
    next_month = "Jan"
  else:
    next_month = month_list[month_list.index(month)+1]
  for date in data:
    if date["month"] == month:
      month1.append(date)
    elif date["month"] == next_month:
      month2.append(date)

  month1_avg = 0
  for month in month1:
    month1_avg += month["price"]
  month1_avg = month1_avg/len(month1)

  month2_avg = 0
  for month in month2:
    month2_avg += month["price"]
  month2_avg = month2_avg/len(month2)

  change = month2_avg - month1_avg
  return change

@app.route("/api/get_stations")
def get_stations():
  city = str(request.args.get("city")).lower()
  data = []

  file = open("static/data/" + city + ".json", "r")
  city_data = json.loads(file.read())
 
  for station in city_data:
    individual_station = {}
    if "title" in station and "gasPrices" in station:
      individual_station["name"] = station["title"]
      individual_station["prices"] = station["gasPrices"]
      individual_station["lat"] = station["location"]["lat"]
      individual_station["lng"] = station["location"]["lng"]
      individual_station["address"] = station["address"]
      data.append(individual_station)
      
  return data, 200

@app.route("/prediction")
def render_prediction():
  return render_template("prediction.html")

@app.route("/api/get_prediction")
def return_predictions():

  oct_price = float(request.args.get("price"))
  city = str(request.args.get("city"))

  
  file = open("static/data/historical_prices.json", "r")
  raw_data = json.loads(file.read())
  data = raw_data["data"]
  trimmed_data_iter1 = []
  trimmed_data = []
  
  for date in data:
    year = date["date"][-4:]

    if year == "2021" or year == "2020":
      trimmed_data_iter1.append(date)

  date_list = []
  for date in trimmed_data_iter1:
    month = date["date"][0:3]
    year = date["date"][-4:]
    mix = str(month+year)
    if mix in date_list:
      continue
    else:
      trimmed_data.append({
        "month" : month,
        "year" : int(year),
        "price": date["price"]
      })
      date_list.append(mix)

  oct_change = get_change("Oct", trimmed_data)
  nov_change = get_change("Nov", trimmed_data)
  dec_change = get_change("Dec", trimmed_data)
  jan_change = get_change("Jan", trimmed_data)
  feb_change = get_change("Feb", trimmed_data)

  predicted_prices = {
    "Oct" : oct_price,
    "Nov" : oct_price + oct_change,
    "Dec" : oct_price + oct_change + nov_change,
    "Jan" : oct_price + oct_change + nov_change + dec_change,
    "Feb" : oct_price + oct_change + nov_change + dec_change + jan_change,
    "Mar" : oct_price + oct_change + nov_change + dec_change + jan_change + feb_change,
  }
  
  return predicted_prices, 200

if __name__ == "__main__":
  app.run(host="0.0.0.0", debug="true")

 