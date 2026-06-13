import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def get_smart_suggestion(order_type, pickup, drop, priority):
    """
    Uses Gemini API to provide an intelligent summary of the delivery and route reasoning.
    """
    if not GEMINI_API_KEY:
        raise Exception("GEMINI_API_KEY is not configured in environment.")
        
    genai.configure(api_key=GEMINI_API_KEY)
    
    # We use gemini-1.5-flash for text generation
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    type_description = "A Canteen/Shop delivery relay" if order_type == 'canteen_delivery' else "A Peer-to-Peer emergency item lending"
    
    prompt = f"""
    You are an AI logistics assistant for a campus app called 'UniDrop'.
    A user has requested a delivery:
    - Type: {type_description}
    - Pickup: {pickup}
    - Drop-off: {drop}
    - Priority: {priority}
    
    Provide a JSON response with:
    - "recommendation": A mocked intelligent student courier name who frequently travels this route.
    - "fastest_route": A logical sounding campus route taking this delivery.
    - "reasoning": A brief startup-friendly explanation (max 2 sentences) of why this is the best match.
    
    Output strictly valid JSON.
    """
    
    response = model.generate_content(prompt)
    
    try:
        # Strip potential markdown formatting if returned
        clean_text = response.text.replace('```json', '').replace('```', '').strip()
        suggestion = json.loads(clean_text)
        return suggestion
    except Exception as e:
        # Fallback if AI hallucinates non-JSON
        return {
            "recommendation": "Alex Student (Campus Hero)",
            "fastest_route": "Direct route",
            "reasoning": response.text
        }

def generate_product_emoji(product_name: str) -> str:
    """
    Uses Gemini API to generate a single relevant emoji for a given product name.
    """
    if not GEMINI_API_KEY:
        return "📦"
        
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        You are an AI assistant for a campus marketplace. 
        Given the following product name, return exactly ONE highly relevant unicode emoji that represents it.
        Do not return any other text, just the single emoji character.
        
        Product Name: {product_name}
        Emoji:
        """
        
        response = model.generate_content(prompt)
        emoji = response.text.strip()
        
        # Simple validation: if the response is too long, it's not a single emoji
        if len(emoji) > 5:
            return "📦"
            
        return emoji if emoji else "📦"
    except Exception as e:
        print(f"Error generating emoji: {e}")
        return "📦"
