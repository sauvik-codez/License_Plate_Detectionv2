🔹upload_image()

PURPOSE:
Receives an image file from the client and stores it on the server for processing.

DESCRIPTION:

Accepts image input via POST request

Validates file format (jpg, png, jpeg)

Saves image in the uploads/ directory

Used In:
All image-processing functions

🔹convert_to_grayscale()

Endpoint: /grayscale
Method: POST

PURPOSE:
Converts a color image into a grayscale image.

DESCRIPTION:

Reads uploaded image using OpenCV

Converts BGR image to grayscale

Saves processed image in outputs/

Returns grayscale image as response

OpenCV Function Used:
cv2.cvtColor()

🔹resize_image()

Endpoint: /resize
Method: POST

PURPOSE:
Resizes an image to user-defined width and height.

DESCRIPTION:

Accepts width and height as parameters

Resizes image using OpenCV

Maintains image quality

Saves resized image

OpenCV Function Used:
cv2.resize()

🔹edge_detection()

Endpoint: /edges
Method: POST

PURPOSE:
Detects edges in an image using the Canny algorithm.

DESCRIPTION:

Converts image to grayscale

Applies Canny edge detection

Highlights object boundaries

Returns edge-detected image

OpenCV Function Used:
cv2.Canny()

🔹read_image()

PURPOSE:
Reads image files from disk for processing.

DESCRIPTION:

Loads image into memory as NumPy array

Used internally by all processing functions

OpenCV Function Used:
cv2.imread()

🔹save_image()

PURPOSE:
Saves processed images to disk.

DESCRIPTION:

Writes processed image to outputs/ directory

Ensures persistence of results

OpenCV Function Used:
cv2.imwrite()

🔹error_handler()

PURPOSE:
Handles invalid inputs and runtime errors.

DESCRIPTION:

Checks if image is missing

Handles unsupported file formats

Returns meaningful error messages

🔁 API FLOW SUMMARY

Client sends image via API request

Image is validated and saved

Requested processing function is applied

Processed image is returned as response

✅ Advantages

Modular function design

Easy to extend with new features

Suitable for ML preprocessing

Beginner-friendly API structure

