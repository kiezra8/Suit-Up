import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const AdminPanel = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('products'); // products, categories, banners
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form states
    const [formData, setFormData] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        const { data, error } = await supabase.from(activeTab).select('*').order('id', { ascending: true });
        if (error) {
            console.error('Error fetching data:', error);
        } else {
            setItems(data || []);
        }
        setLoading(false);
    };

    const uploadImage = async (file) => {
        try {
            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `${activeTab}/${fileName}`;

            const { error: uploadError, data } = await supabase.storage
                .from('images') // Ensure you created this bucket in Supabase!
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            alert('Error uploading image: ' + error.message);
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        let errorObj;
        
        const payload = { ...formData };
        
        // Handle file upload if a new file is selected
        if (payload._imageFile) {
            const uploadedUrl = await uploadImage(payload._imageFile);
            if (uploadedUrl) {
                payload.image = uploadedUrl;
            } else {
                setLoading(false);
                return; // Stop if upload failed
            }
            delete payload._imageFile;
        }

        if (!payload.id) {
            delete payload.id;
            const { error } = await supabase.from(activeTab).insert([payload]);
            errorObj = error;
        } else {
            const { error } = await supabase.from(activeTab).update(payload).eq('id', payload.id);
            errorObj = error;
        }

        if (errorObj) {
            alert('Error saving data: ' + errorObj.message);
        } else {
            setFormData(null);
            fetchData();
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        setLoading(true);
        const { error } = await supabase.from(activeTab).delete().eq('id', id);
        if (error) {
            alert('Error deleting data: ' + error.message);
        } else {
            fetchData();
        }
        setLoading(false);
    };

    const handleEdit = (item) => {
        setFormData(item);
    };

    return (
        <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Admin Dashboard</h2>
                <button 
                    onClick={onBack} 
                    style={{ background: '#333', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                >
                    Back to Store
                </button>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                {['products', 'categories', 'banners'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setFormData(null); }}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: '1px solid #ccc',
                            background: activeTab === tab ? '#ff6b6b' : '#fff',
                            color: activeTab === tab ? '#fff' : '#333',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Manage {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {loading && <div>Loading...</div>}

            {formData ? (
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                    <h3>{formData.id ? 'Edit' : 'Add New'} {activeTab.slice(0, -1)}</h3>
                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                        
                        {activeTab === 'categories' && (
                            <>
                                <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Category ID (Slug)</label>
                                <input style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} placeholder="e.g. dresses" value={formData.id || ''} onChange={e => setFormData({ ...formData, id: e.target.value })} required disabled={!!formData.id} />
                                <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Category Name</label>
                                <input style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} placeholder="Name" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Upload Image</label>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff' }} 
                                    onChange={e => {
                                        const file = e.target.files[0];
                                        if (file) setFormData({ ...formData, _imageFile: file, image: URL.createObjectURL(file) });
                                    }} 
                                />
                            </>
                        )}

                        {activeTab === 'banners' && (
                            <>
                                <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Banner Title</label>
                                <input style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} placeholder="Title" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                                <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Subtitle Text</label>
                                <input style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} placeholder="Text" value={formData.text || ''} onChange={e => setFormData({ ...formData, text: e.target.value })} />
                                <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Upload Image</label>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff' }} 
                                    onChange={e => {
                                        const file = e.target.files[0];
                                        if (file) setFormData({ ...formData, _imageFile: file, image: URL.createObjectURL(file) });
                                    }} 
                                />
                            </>
                        )}

                        {activeTab === 'products' && (
                            <>
                                <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Product Name</label>
                                <input style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} placeholder="Name" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Category ID</label>
                                <select 
                                    style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff' }} 
                                    value={formData.category || ''} 
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    <option value="dresses">Dresses</option>
                                    <option value="office">Office</option>
                                    <option value="suits">Suits</option>
                                    <option value="casual">Casual</option>
                                    <option value="traditional">Ethnic</option>
                                    <option value="sportswear">Sports</option>
                                    <option value="nightwear">Night</option>
                                    <option value="watches">Watches</option>
                                    <option value="shoes">Shoes</option>
                                    <option value="accessories">Style</option>
                                </select>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div>
                                        <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Price (UGX)</label>
                                        <input type="number" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} value={formData.price || ''} onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) })} required />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Old Price (UGX)</label>
                                        <input type="number" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} value={formData.oldPrice || ''} onChange={e => setFormData({ ...formData, oldPrice: parseInt(e.target.value) })} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div>
                                        <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Rating</label>
                                        <input type="number" step="0.1" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} value={formData.rating || ''} onChange={e => setFormData({ ...formData, rating: parseFloat(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Reviews</label>
                                        <input type="number" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} value={formData.reviews || ''} onChange={e => setFormData({ ...formData, reviews: parseInt(e.target.value) })} />
                                    </div>
                                </div>
                                <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Upload Image</label>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff' }} 
                                    onChange={e => {
                                        const file = e.target.files[0];
                                        if (file) setFormData({ ...formData, _imageFile: file, image: URL.createObjectURL(file) });
                                    }} 
                                />
                            </>
                        )}

                        {uploading && <p style={{ color: '#ff6b6b', fontSize: '14px', fontWeight: 'bold' }}>Uploading image...</p>}

                        {formData.image && (
                            <div style={{ marginTop: '10px' }}>
                                <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>{formData._imageFile ? 'Selected File Preview:' : 'Current Product Image:'}</p>
                                <img 
                                    src={formData.image} 
                                    alt="Preview" 
                                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #ff6b6b' }}
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                    onLoad={(e) => { e.target.style.display = 'block'; }}
                                />
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" style={{ padding: '10px 20px', background: '#ff6b6b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Save</button>
                            <button type="button" onClick={() => setFormData(null)} style={{ padding: '10px 20px', background: '#999', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                        </div>
                    </form>
                </div>
            ) : (
                <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                        <h3>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} List</h3>
                        <button onClick={() => setFormData({})} style={{ background: '#4ecdc4', color: '#fff', padding: '8px 15px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                            + Add New
                        </button>
                    </div>
                    
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
                                <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                                {activeTab === 'products' && <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>}
                                {activeTab === 'categories' && <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>}
                                {activeTab === 'banners' && <th style={{ padding: '12px', textAlign: 'left' }}>Title</th>}
                                <th style={{ padding: '12px', textAlign: 'left' }}>Image</th>
                                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px' }}>{item.id}</td>
                                    {activeTab === 'products' && <td style={{ padding: '12px' }}>{item.name}</td>}
                                    {activeTab === 'categories' && <td style={{ padding: '12px' }}>{item.name}</td>}
                                    {activeTab === 'banners' && <td style={{ padding: '12px' }}>{item.title}</td>}
                                    <td style={{ padding: '12px' }}>
                                        <img src={item.image} alt="preview" style={{ height: '40px', width: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'right' }}>
                                        <button onClick={() => handleEdit(item)} style={{ marginRight: '10px', background: '#ffca28', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                                        <button onClick={() => handleDelete(item.id)} style={{ background: '#ef5350', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>No data found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
