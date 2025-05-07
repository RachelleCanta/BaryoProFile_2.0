import React from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./customToast.css";

function CustomToast({ closeToast, text, confirmFunc, cancelFunc }) {
  const handleConfirm = () => {
    // toast.success("Confirmed!");
    confirmFunc();
    closeToast();
  };

  const handleCancel = () => {
    toast.info("Cancelled.");
    if (cancelFunc) {
      cancelFunc();
    }
    closeToast();
  };

  return (
    <div className="custom-toast-outer-div">
      <p>{text}</p>
      <div className="custom-toast-inner-div">
        <button onClick={handleConfirm} className="yes-btn">
          Yes
        </button>
        <button onClick={handleCancel} className="no-btn">
          No
        </button>
      </div>
    </div>
  );
}

export { CustomToast };
