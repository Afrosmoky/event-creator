import { render } from 'solid-js/web';
import { Router, Route } from '@solidjs/router';
import { Root } from './Root.tsx';
import './index.css';

document.getElementById('spa-loader')!.outerHTML = '';
render(
  () => (
    <Router>
      <Route path="/svg-editor" component={Root} />
    </Router>
  ),
  document.body
);
