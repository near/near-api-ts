import cn from './App.module.css';
import { Main } from './Main/Main.tsx';
import { Topbar } from './Topbar/Topbar.tsx';

export const App = () => {
  return (
    <div className={cn.app}>
      <Topbar />
      <Main />
    </div>
  );
};
