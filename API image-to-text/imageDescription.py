from azure.cognitiveservices.vision.computervision import ComputerVisionClient
from msrest.authentication import CognitiveServicesCredentials

from azure.storage.blob import BlobServiceClient


#------------------------------------Cloud Storage credentials and clients---------------------------------
#Pegue aquí el connection_string para poder ver el funcionamiento
blob_service_client = BlobServiceClient.from_connection_string(connection_string)
container_name = "myimagecontainer"
container_client = blob_service_client.get_container_client(container_name)


#------------------------------------Image describer and analyser AI (Computer Vision) Credentials---------------------------------
#Pegue aquí el ENDPOINT y el API_KEY para poder ver el funcionamiento


def describe_images(image_path):

    #Esta sección del código se encarga de subir a la nube que creé la imagen del path dado, para poder obtener una URL de la misma.
    #Deberíamos Generar una función que tome todas las imagenes que se subieron a la pagina y subirlas todas a la nube de esta forma.
    blob_name = "BeerGuy.jpeg"  # TODO: Aquí es importante que el nombre sea distinto para cada imagen

    blob_client = blob_service_client.get_blob_client(container= container_name, blob=blob_name)

    with open(image_path, "rb") as image_file:
        blob_client.upload_blob(image_file)
    print(f"Image '{blob_name}' uploaded successfully!")
    #Entonces este de arriba código de arriba podemos sacarlo a otra función diferente que vaya cargando cada imagen de una a una a la nube



    #Esta sección que queda de la función va tomando todas las imágenes y las va analizando de una a una. Aquí la idea sería que en lugar
    #de imprimir la descripción con el "description_results.captions[0].text", que lo peguemos todo junto en el archivo de texto que
    #vamos a mandar al analizador de texto de Google.
    computervision_client = ComputerVisionClient(ENDPOINT, CognitiveServicesCredentials(API_KEY))
    blob_list = container_client.list_blobs() 

    for blob in blob_list:
        blob_url = "https://describedimages.blob.core.windows.net/myimagecontainer/" + blob.name

        description_results = computervision_client.describe_image(blob_url)

        if description_results.captions:
            print(description_results.captions[0].text)
        else:
            print("No description found.")

#This function deletes every image in the cloud to keep it clean after doing the uploading and analizing process    
def delete_all_blobs():
    blob_list = container_client.list_blobs()  

    for blob in blob_list:
        blob_client = container_client.get_blob_client(blob.name)
        blob_client.delete_blob()    

# Copie el path de alguna de las imagenes y lo pega ahí, se tiene que usar la barra inclinada "/".
# Ahora mismo solo le va a devolver el resultado de una imagen como es lógico, la idea como expliqué arriba, es tomar el path de todas
# las imagenes que nos den los usuarios e ir de una a una cargandolas en la nube en otra función, por lo que la llamada de la función
# "describe_images" de abajo se hará sin parámetros en el futuro.         
image_path = "C:/Users/Usuario/OneDrive/Escritorio/Trabajos/Pruebas Python/depositphotos_73308229-stock-photo-happy-man-drinking-beer-at.jpg"
describe_images(image_path)

delete_all_blobs()