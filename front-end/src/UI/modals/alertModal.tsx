import React from "react";
import { moderationType } from "../../types/types";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";

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
  console.log(alertReasons);
  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box
        sx={{
          position: "absolute" as "absolute",
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
        <Button onClick={handleClose}>Close modal</Button>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Alertas
        </Typography>
        {alertReasons.map((alertReason, index) => (
          <div key={index}>
            <Typography variant="h6" component="h3">
              Alerta en {alertReason.option}
            </Typography>
            <ul>
              {alertReason.words.map((word, wordIndex) => (
                <li key={wordIndex}>
                  {Object.keys(word).map((key, subIndex) => (
                    <span key={subIndex}>
                      {key}:{" "}
                      {Array.isArray(word[key])
                        ? word[key].map((item, itemIndex) => (
                            <span key={itemIndex}>{item} </span>
                          ))
                        : <span key={key}>{word[key]}</span>}
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
