import { moderationType } from "../../types/types";

interface AlertReason {
  option: string;
  category: string;
  words: moderationType[];
}

interface AlertModalProps {
  isOpen: boolean;
  handleClose: () => void;
  alertReasons: AlertReason[];
}

export const AlertModal: React.FC<AlertModalProps> = ({ isOpen, handleClose, alertReasons }) => {
  return (
    isOpen && (
      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={handleClose}>
            &times;
          </span>
          <h2>Alertas</h2>
          {alertReasons.map((alertReason, index) => (
            <div key={index}>
              <h3>Alerta en {alertReason.option}</h3>
              <p>Categoría: {alertReason.category}</p>
              <p>Palabras: {alertReason.words.join(', ')}</p>
            </div>
          ))}
        </div>
      </div>
    )
  );
};
