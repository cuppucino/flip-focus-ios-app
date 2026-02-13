from PIL import Image
try:
    img = Image.open("assets/splash-icon.png").convert("RGBA")
    print(f"Size: {img.size}")
    
    # Check center pixel
    center = (img.width // 2, img.height // 2)
    print(f"Center Pixel: {img.getpixel(center)}")
    
    # Check bounds
    bbox = img.getbbox()
    print(f"Bounding Box: {bbox}")
    
except Exception as e:
    print(e)
