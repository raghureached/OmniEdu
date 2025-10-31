import React from 'react';
import { EyeIcon } from 'lucide-react';
import { GoX } from 'react-icons/go';

const FilePreviewModal = ({ open, filePreview, onClose }) => {
  if (!open || !filePreview?.url) {
    return null;
  }

  const { url, name, type } = filePreview;
  const isPdfOrUrl = type === 'application/pdf' || /^https?:/i.test(url);
  const isImage = type === 'image/*' || type?.startsWith('image/');
  const isVideo = type === 'video/*' || type?.startsWith('video/');
  const isAudio = type === 'audio/*' || type?.startsWith('audio/');

  return (
    <div className="addOrg-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="filePreviewTitle">
      <div className="addOrg-modal-content" style={{  width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div className="addOrg-modal-header">
          <div className="addOrg-header-content">
            <div className="addOrg-header-icon">
              <EyeIcon size={24} color="#5570f1" />
            </div>
            <div>
              <h2 id="filePreviewTitle">Preview: {name || 'Preview'}</h2>
            </div>
          </div>
          <button type="button" className="addOrg-close-btn" onClick={onClose} aria-label="Close file preview">
            <GoX size={20} />
          </button>
        </div>
        <div className="module-overlay__body" style={{ flex: 1, overflow: 'hidden' }}>
          {isImage ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f7f7' }}>
              <img
                src={url}
                alt={name || 'Preview'}
                style={{ width: '100%', height: '100%',border: "1px solid #9E9E9E",
                  borderRadius: "10px" }}
              />
            </div>
          ) : isPdfOrUrl ? (
            <iframe title="File Preview" src={url} width="100%" height="100%" style={{ border: 'none', height: '100%' }} />
          ) : isVideo ? (
            <video src={url} controls style={{ width: '100%', height: '100%' }} />
          ) : isAudio ? (
            <div style={{ padding: '16px' }}>
              <audio src={url} controls style={{ width: '100%' }} />
            </div>
          ) : (
            <div style={{ padding: '16px' }}>
              <p>Preview not supported. You can download and view the file.</p>
              <a href={url} download={name || 'preview'} className="btn-primary">Download</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
