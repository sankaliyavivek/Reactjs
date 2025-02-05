import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function UserEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    useEffect(() => {
        axios.get(`http://localhost:8000/user/getuser/${id}`, {
            withCredentials: true,
        })
        .then(response => {
            console.log(response.data); 
            setName(response.data.showUserData.name);
            setEmail(response.data.showUserData.email);
            setPhone(response.data.showUserData.phone);
        })
        .catch(error => {
            console.log(error);
        });
    }, [id]); 

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:8000/user/edituser/${id}`, {
                name: name,
                email: email,
                phone: phone
            }, { withCredentials: true });

            alert('User data updated successfully');
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            alert('Error updating user data');
        }
    };

    return (
        <div className='mt-5'>
            <div className='d-flex flex-column justify-content-center align-items-center'>
                <h2>User Edit</h2>
                <form className='w-25' onSubmit={handleUpdate}>
                    {/* Name Input */}
                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    {/* Email Input */}
                    <div className="mb-3">
                        <input
                            type="email"
                            className="form-control"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {/* Phone Input */}
                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-100">
                        Edit
                    </button>
                </form>
            </div>
        </div>
    );
}

export default UserEdit;
