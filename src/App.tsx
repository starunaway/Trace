import axios from 'axios';

function App() {
  const handleClick = () => {
    throw new Error('sdf');
  };

  const handlefetch = async () => {
    const response = await fetch('https://jsonp1111laceholder.typicode.com/todos/1');
    const data = await response.json();
    console.log(data);
  };

  const handlereject = async () => {
    Promise.reject('sdf');
  };

  const handleawaitreject = async () => {
    await Promise.reject('sdf');
  };

  const handlerejecterror = async () => {
    Promise.reject(new Error('Another error'));
  };

  return (
    <div>
      trace
      <button onClick={handleClick}>throw</button>
      <button onClick={handlefetch}>fetch</button>
      <button onClick={handlereject}>promise.reject</button>
      <button onClick={handleawaitreject}> await promise.reject</button>
      <button onClick={handlerejecterror}> promise.reject error</button>
      <button
        onClick={() => {
          console.log(d.d);
        }}
      >
        d.d
      </button>
      <button
        onClick={() => {
          // add script
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdel222ivr.net/npm/axios/dist/axios.min.js';
          document.body.appendChild(script);
        }}
      >
        add script
      </button>
      <button
        onClick={() => {
          // add script
          const img = document.createElement('img');
          img.src = 'https://cdn.jsdel222ivr.net/npm/axios/dist/axios.min.js';
          document.body.appendChild(img);
        }}
      >
        add img
      </button>
      <button
        onClick={() => {
          // add script
          const link = document.createElement('link');
          link.href = 'https://cdn.jsdel222ivr.net/npm/axios/dist/axios.min.js';
          link.rel = 'stylesheet';
          link.type = 'text/css';
          document.body.appendChild(link);
        }}
      >
        add link
      </button>
      <button
        onClick={() => {
          const img = new Image();
          img.src = 'https://cdn.jsdel222ivr.net/npm/axios/dist/axios.min.js';
          // document.body.appendChild(img);
        }}
      >
        new image
      </button>
      <button
        onClick={() => {
          axios.get('https://ddd.typicode.com/todos/1');
        }}
      >
        axios error url
      </button>
      <button
        onClick={() => {
          axios.get('http://localhost:3001/api/404');
        }}
      >
        axios 404
      </button>
      <button
        onClick={() => {
          axios.get('http://localhost:3001/api/200');
        }}
      >
        axios 200
      </button>
      <button
        onClick={() => {
          axios.get('http://localhost:3001/api/timeout', {
            timeout: 100,
            params: {
              a: 1,
              b: 421,
            },
            data: {
              c: 1,
              d: 421,
            },
          });
        }}
      >
        axios timeout
      </button>
      <button
        onClick={() => {
          axios.post('http://localhost:3001/api/timeout', new FormData(), {
            timeout: 100,

            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        }}
      >
        axios post
      </button>
    </div>
  );
}

export default App;
