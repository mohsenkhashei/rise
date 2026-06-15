#!/usr/bin/env python3
import json
import os
import sys
import urllib.request
import urllib.error

def validate_json_file(file_path):
    if not os.path.exists(file_path):
        print(f"❌ Error: File not found at {file_path}")
        return None
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if not isinstance(data, list):
                print(f"❌ Error: {file_path} must be a JSON array.")
                return None
            return data
    except json.JSONDecodeError as e:
        print(f"❌ Error parsing {file_path}: {e}")
        return None

def validate_quotes(quotes):
    errors = []
    seen_quotes = set()
    
    for idx, quote in enumerate(quotes):
        if not isinstance(quote, dict):
            errors.append(f"Quote at index {idx} is not an object.")
            continue
        
        text = quote.get("text", "").strip()
        author = quote.get("author", "").strip()
        
        if not text:
            errors.append(f"Quote at index {idx} has an empty 'text' field.")
        if not author:
            errors.append(f"Quote at index {idx} has an empty 'author' field.")
            
        # Standardize quote text to check for duplicates (letters and numbers only)
        normalized_text = "".join(c for c in text.lower() if c.isalnum())
        if normalized_text in seen_quotes:
            errors.append(f"Duplicate quote found: \"{text}\" by {author}")
        else:
            seen_quotes.add(normalized_text)
            
    return errors

def validate_wallpapers(wallpapers):
    errors = []
    
    for idx, wp in enumerate(wallpapers):
        if not isinstance(wp, dict):
            errors.append(f"Wallpaper at index {idx} is not an object.")
            continue
            
        url = wp.get("url", "").strip()
        photographer = wp.get("photographer", "").strip()
        location = wp.get("location", "").strip()
        
        if not url:
            errors.append(f"Wallpaper at index {idx} has an empty 'url' field.")
        if not photographer:
            errors.append(f"Wallpaper at index {idx} has an empty 'photographer' field.")
        if not location:
            errors.append(f"Wallpaper at index {idx} has an empty 'location' field.")
            
        if url:
            # Check if URL returns 200 and has image content type
            try:
                req = urllib.request.Request(
                    url, 
                    method='HEAD', 
                    headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'}
                )
                with urllib.request.urlopen(req, timeout=5) as response:
                    content_type = response.headers.get('Content-Type', '')
                    if not content_type.startswith('image/'):
                        errors.append(f"Wallpaper {url} is not an image (Content-Type: {content_type}).")
            except urllib.error.HTTPError as e:
                errors.append(f"Wallpaper URL {url} returned HTTP {e.code}.")
            except urllib.error.URLError as e:
                errors.append(f"Wallpaper URL {url} is unreachable: {e.reason}.")
            except Exception as e:
                errors.append(f"Wallpaper URL {url} error: {e}")
                
    return errors

def main():
    print("🔄 Starting validation of Rise data files...")
    
    project_dir = os.path.dirname(os.path.abspath(__file__))
    quotes_path = os.path.join(project_dir, "data", "quotes.json")
    wallpapers_path = os.path.join(project_dir, "data", "wallpapers.json")
    
    quotes = validate_json_file(quotes_path)
    wallpapers = validate_json_file(wallpapers_path)
    
    if quotes is None or wallpapers is None:
        sys.exit(1)
        
    quote_errors = validate_quotes(quotes)
    wallpaper_errors = validate_wallpapers(wallpapers)
    
    all_errors = quote_errors + wallpaper_errors
    
    if all_errors:
        print(f"\n❌ Validation Failed with {len(all_errors)} error(s):")
        for err in all_errors:
            print(f"  - {err}")
        sys.exit(1)
    else:
        print("\n✅ Validation Passed! All files are formatted correctly, quotes are unique, and wallpapers are reachable.")
        sys.exit(0)

if __name__ == "__main__":
    main()
