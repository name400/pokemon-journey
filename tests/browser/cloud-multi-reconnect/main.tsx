import React from 'react';
import {createRoot} from 'react-dom/client';
import Adventure from '../../../components/cloud-adventure/entry';
import '../../../app/globals.css';
createRoot(document.getElementById('root')!).render(<div className="cloud-adventure-view"><Adventure/></div>);
