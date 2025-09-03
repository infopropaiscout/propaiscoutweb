import React from 'react';
import ReactDOM from 'react-dom';
import { Dialog } from '@mui/material';

const DialogPortal = ({ children, ...props }) => {
  const portalRoot = document.getElementById('portal-root');

  if (!portalRoot) {
    const div = document.createElement('div');
    div.id = 'portal-root';
    document.body.appendChild(div);
  }

  return ReactDOM.createPortal(
    <Dialog {...props}>
      {children}
    </Dialog>,
    document.getElementById('portal-root')
  );
};

export default DialogPortal;
