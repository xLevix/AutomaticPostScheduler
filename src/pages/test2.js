import { useState } from 'react';

function DataPage() {
    const [data, setData] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        const response = await fetch('/api/form2', {
            method: 'POST',
            body: JSON.stringify({ data: 'example data' }),
        });
        const json = await response.json();
        setData(json.message);
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <button type="submit">Wyślij dane</button>
            </form>
            <p>{data}</p>
        </div>
    );
}

export default DataPage;
