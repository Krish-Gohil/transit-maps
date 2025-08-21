import React from 'react';

export default function TextBox({id, placeholder, value, onChange}) {
    return (
        <input
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className='border border-blue-700 bg-gray-200 rounded-lg w-full p-1.5 px-3 mt-2 mb-213 shadow-md placeholder-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500'
        />
    )
}