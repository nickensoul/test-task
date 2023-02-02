import React from 'react';

import { Game } from './components/Game';
import s from './styles.module.css';

const App = () => (
  <div className={s.root}>
    <Game />
  </div>
);

export default App;
