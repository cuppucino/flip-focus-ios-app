from PIL import Image

try:
    img = Image.open("assets/splash-icon.png").convert("RGBA")
    data = img.getdata()
    
    visible_pixels = [p for p in data if p[3] > 0]
    
    if visible_pixels:
        # Average color
        r = sum([p[0] for p in visible_pixels]) // len(visible_pixels)
        g = sum([p[1] for p in visible_pixels]) // len(visible_pixels)
        b = sum([p[2] for p in visible_pixels]) // len(visible_pixels)
        print(f"Average Visible Color: ({r}, {g}, {b})")
        print(f"First Visible Pixel: {visible_pixels[0]}")
    else:
        print("Image is fully transparent!")

except Exception as e:
    print(e)
