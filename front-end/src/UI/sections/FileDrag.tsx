import "./FileDrag.css";
import { useCallback } from "react";
import upload from "@assets/upload.webp";
import { useDropzone } from "react-dropzone";

export function FileDrag() {
  const onDrop = useCallback((acceptedFiles: Array<File>) => {
    console.log(acceptedFiles);

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

    console.log(chat);
    console.log(imgs);
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
    <div className="dg-container">
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
    </div>
  );
}
