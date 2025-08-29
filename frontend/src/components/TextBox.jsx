import React from 'react';

export default function TextBox({id, placeholder, value, onChange}) {
    return (
        <input
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className='border border-gray-600 bg-gray-700 text-white rounded-lg w-full p-1.5 px-3 mt-2 mb-2 shadow-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
        />
    )
}