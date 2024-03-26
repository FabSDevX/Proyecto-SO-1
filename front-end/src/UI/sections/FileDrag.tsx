import './FileDrag.css';
import { useCallback } from 'react';
import upload from '@assets/upload.webp'
import { useDropzone } from 'react-dropzone';

export function FileDrag() {

    const onDrop = useCallback((acceptedFiles: Array<File>) => {
        console.log(acceptedFiles)
    }, []);

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({ onDrop, noClick:true });

    return (
        <div className='dg-container'>
            <h4 className='dg-title'>Subir o arrastrar el archivo</h4>
            <div
                className="dg-actor"
                {...getRootProps()}
                onClick={(event) => event.stopPropagation()}
            >
                <input {...getInputProps({ multiple: true })} />
                {
                    isDragActive ?
                    <img className='dg-img' src={upload} alt="upload img" /> :
                    <button type='button' className='dg-button' onClick={open}>
                         Subir Archivo
                    </button>
                 }
            </div>
        </div>
    );
}
