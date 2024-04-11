import React from "react";
import { moderationType } from "../../types/types";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import "./alertModal.css";

interface AlertReason {
  option: string;
  words: moderationType[];
}

interface AlertModalProps {
  isOpen: boolean;
  handleClose: () => void;
  alertReasons: AlertReason[];
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  handleClose,
  alertReasons,
}) => {
  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
        }}
      >
        <Button onClick={handleClose}>Cerrar</Button>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          <span>Alertas</span>
          <p>
            Estas son algunas palabras y elementos que podrian estar activando las alarmas
          </p>
        </Typography>
        {alertReasons.map((alertReason, index) => (
          <div key={index}>
            <Typography variant="h6" component="h3">
              Alerta en {alertReason.option}

            </Typography>
            <ul className="modal-ul">
              {alertReason.words.map((word, wordIndex) => (
                <li className="modal-li" key={wordIndex}>
                  {Object.keys(word).map((key, subIndex) => (
                    <span className="modal-category" key={subIndex}>
                      {key}:{" "}
                      {Array.isArray(word[key])
                        ? word[key].map((item, itemIndex) => (
                          <span className="modal-item" key= {itemIndex}> {item} </span>
                        ))
                        : <span className="modal-item" key={key}> {word[key]} </span>}
                    </span>
                  ))}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Box>
    </Modal>
  );
};
