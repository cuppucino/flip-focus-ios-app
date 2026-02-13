import sys
from PIL import Image

def center_icon(input_path, output_path, size=(1024, 1024), padding_percent=0.2):
    try:
        img = Image.open(input_path).convert("RGBA")
        
        # Get bounding box of non-transparent pixels
        bbox = img.getbbox()
        if not bbox:
            print("Image is empty or transparent")
            return

        # Crop to content
        content = img.crop(bbox)
        
        # Calculate new size maintaining aspect ratio
        content_width, content_height = content.size
        max_dim = max(content_width, content_height)
        
        target_size = int(size[0] * (1 - padding_percent * 2))
        scale_factor = target_size / max_dim
        
        new_width = int(content_width * scale_factor)
        new_height = int(content_height * scale_factor)
        
        resized_content = content.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Create new canvas
        new_img = Image.new("RGBA", size, (255, 255, 255, 0)) # Transparent background
        
        # Calculate center position
        x = (size[0] - new_width) // 2
        y = (size[1] - new_height) // 2
        
        new_img.paste(resized_content, (x, y), resized_content)
        
        new_img.save(output_path)
        print(f"Centered icon saved to {output_path}")

    except Exception as e:
        print(f"Error processing image: {e}")

if __name__ == "__main__":
    center_icon("assets/icon.png", "assets/icon.png")
    center_icon("assets/icon.png", "assets/adaptive-icon.png")
