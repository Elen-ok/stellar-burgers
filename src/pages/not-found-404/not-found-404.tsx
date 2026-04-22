import { Link } from 'react-router-dom';

export const NotFound404 = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: 'calc(100vh - 88px)',
      textAlign: 'center'
    }}>
      <h1 className="text text_type_digits-large mb-5">404</h1>
      <p className="text text_type_main-medium mb-5">Страница не найдена</p>
      <p className="text text_type_main-default text_color_inactive mb-10">
        К сожалению, запрошенная страница не существует
      </p>
      <Link to="/">
        <button className="button button_type_primary">Вернуться на главную</button>
      </Link>
    </div>
  );
};

export default NotFound404;
