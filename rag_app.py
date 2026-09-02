import requests
import chromadb

CHROMA_FOLDER = "chroma_db"


OLLAMA_URL = "http://localhost:11434"
EMBEDDING_MODEL = "nomic-embed-text"
LLM_MODEL= "llama3.2:1b"

client = chromadb.PersistentClient(path = CHROMA_FOLDER)
collection = client.get_collection(name = "company_knowledge")

def get_embedding(text):
    response = requests.post(
         f"{OLLAMA_URL}/api/embed",
         json = {
              "model":EMBEDDING_MODEL,
              "input":text
        }
   )
    response.raise_for_status()
    return response.json()["embeddings"][0]


def retrieve_context(question, number_of_results = 3):
   query_embedding = get_embedding(question)
   results = collection.query(
        query_embeddings = [query_embedding],
        n_results = number_of_results
   )
   documents =  results["documents"][0]
   return documents


def ask_llm(prompt):
 
   response = requests.post(
      f"{OLLAMA_URL}/api/generate",
          json = {
               "model":LLM_MODEL,
               "prompt":prompt,
               "stream": False
          }
   )
   response.raise_for_status()
   return response.json()["response"]



def main():
     question = input("\nEnter your question: ")
     normal_prompt = question
     normal_answer = ask_llm(normal_prompt)
     print("\n==========================")
     print("ANSWER WITHOUT RAG")  

     print("========================")  
     print(normal_answer)

     documents = retrieve_context(question)
     context = "\n\n".join(documents)
     rag_prompt =  f"""

      You are an R assistant.
     Answer question using  ONLY the information provided in context.
     If answer is not present in context , say :
     "I don't have this information in knowledge base" 

Context :
 {context}

Question:
 {question}


Answer :
"""
     rag_answer = ask_llm(rag_prompt)
     print("\n======================")
     print("RETRIEVED CONTEXT")
     print(context)
     print("========================")
     print("ANSWER WITH RAG")

     print("========================") 
     print(rag_answer)

if __name__ ==  "__main__":
    main()
