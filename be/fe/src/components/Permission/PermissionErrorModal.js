// PermissionErrorModal.js
import React from 'react';
import './PermissionErrorModal.css';

const PermissionErrorModal = ({ show, onClose, message }) => {
    if (!show) return null;
 
    return (
        <div className="error-modal" onClick={onClose}>
            <div className="error-modal-content" onClick={e => e.stopPropagation()}>
                <div className="error-message">
                    {message || "You do not have permission to perform this action"}
                </div>
                <button onClick={onClose} className="error-close-btn">
                    OK
                </button>
            </div>
        </div>
    );
};

export default PermissionErrorModal;