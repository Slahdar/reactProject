import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const Register = () => {
    const [formData, setFormData] = useState({
      firstname: '',
      lastname: '',
      username: '',
      email: '',
      password: '',
    });
    const [error, setError] = useState('');
  
    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await fetch('http://localhost:3000/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        
        const data = await response.json();
        
        if (data.error) {
          setError(data.error);
          return;
        }
        
        alert('Registration successful! Please check your email to verify your account.');
      } catch (err) {
        setError('An error occurred during registration');
      }
    };
  
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-8">
          <div>
            <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">Créer un compte</h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-md text-center text-sm">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  name="firstname"
                  required
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Prénom"
                  value={formData.firstname}
                  onChange={handleChange}
                />
              </div>
              <div>
                <input
                  type="text"
                  name="lastname"
                  required
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Nom"
                  value={formData.lastname}
                  onChange={handleChange}
                />
              </div>
              <div>
                <input
                  type="text"
                  name="username"
                  required
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Nom d'utilisateur"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  required
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Adresse email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <input
                  type="password"
                  name="password"
                  required
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Mot de passe"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                S'inscrire
              </button>
            </div>

            <div className="text-center">
              <Link 
                to="/login" 
                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium inline-flex items-center group"
              >
                <span className="mr-2 group-hover:-translate-x-1 transition-transform duration-200">
                  ←
                </span>
                Déjà un compte ?
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  };

  export default Register;