import "./FileDrag.css";
import { useCallback } from "react";
import upload from "@assets/upload.webp";
import { useDropzone } from "react-dropzone";

export function FileDrag() {
  const onDrop = useCallback((acceptedFiles: Array<File>) => {
    const acceptedImgsFormats = ["png", "jpg", "jpeg", "webp"];
    const chat: File[] = acceptedFiles.filter((text) =>
      text.name.endsWith(".txt")
    );
    const imgs = acceptedFiles.filter((file) => {
      return acceptedImgsFormats.some((format) =>
        file.name.toLowerCase().endsWith(format)
      );
    });
    const audios: File[] = acceptedFiles.filter((audio) =>
      audio.name.endsWith(".opus")
    );

    async function obtainPlainTextPromise(promise: Promise<string>) {
      try {
        const result = await promise;
        return result;
      } catch (error) {
        console.error("Critical Error obtaining promise:", error);
      }
    }

    async function textAnalysis() {
      if (chat.length > 0) {
        const promise = chat[0].text();
        const text = await obtainPlainTextPromise(promise);
        try {
          const response = await fetch(
            "http://192.168.1.188:5000/api/classify",
            {
              method: "POST",
              body: JSON.stringify({
                text: text,
              }),
              headers: {
                "Content-type": "application/json; charset=UTF-8",
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            console.log(data);
          } else {
            console.error("Request error:", response.status);
          }
        } catch (error) {
          console.error("Process request error:", error);
        }
      }
    }

    async function audioAnalysis() {
      if (audios.length > 0) {
        const formData = new FormData();
        audios.forEach((audio) => {
          formData.append('audio_file', audio);
        });
        fetch("http://localhost:5000/api/transcribe", {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            console.log(data);
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }
    }

    //textAnalysis();
    audioAnalysis();

    // console.log(chat);
    // console.log(imgs);
    console.log(audios);
    // acceptedFiles.forEach((file) => {
    //     const reader = new FileReader()
    //     console.log(reader)
    //     reader.onabort = () => console.log('file reading was aborted')
    //     reader.onerror = () => console.log('file reading has failed')
    //     reader.onload = () => {
    //     // Do whatever you want with the file contents
    //       const binaryStr = reader.result
    //       console.log(binaryStr)
    //     }
    //     //reader.readAsText(file)
    //     //reader.readAsArrayBuffer(file)
    //   })
  }, []);

  /*Props of Dropzone dependency*/
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
  });

  return (
    <section className="dg-container">
      {window.innerWidth >= 600 ? (
        <label className="dg-title">Subir o arrastrar el archivo</label>
      ) : (
        <label className="dg-title">Subir el archivo</label>
      )}
      <div
        className="dg-actor"
        {...getRootProps()}
        onClick={(event) => event.stopPropagation()}
      >
        <input {...getInputProps({ multiple: true })} />
        {isDragActive ? (
          <img className="dg-img" src={upload} alt="upload img" />
        ) : (
          <button type="button" className="dg-button" onClick={open}>
            Subir Archivo
          </button>
        )}
      </div>
      <span className="dg-span-note">
        Formatos aceptados son .txt, .jpg, .png, .jpeg, .opus
      </span>
    </section>
  );
}
