
import requests



url =  "http://127.0.0.1:11434/api/generate"
prompt = input("Enter your question: ")

data = {
                 "model": "llama3.2:1b",
                 "prompt": prompt,
                 "stream": False
}


response  = requests.post(url, json = data)

if response.status_code == 200:
   result = response.json()
   print("\nLLM  Response:")
   print(result["response"])

else:

    print("Error:", response.status_code)
    print(response.text)



