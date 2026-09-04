import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaMap } from 'react-icons/fa';
import VenueMap from '../components/VenueMap';
import API_URL from '../config';
import './EventMap.css';

const EventMap = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);

    useEffect(() => {
        axios.get(`${API_URL}/api/events/${id}`)
            .then(res => setEvent(res.data))
            .catch(err => console.error(err));
    }, [id]);

    return (
        <div className="full-map-page">
            <div className="full-map-header">
                <button className="back-map-btn" onClick={() => navigate(`/event/${id}`)}>
                    <FaArrowLeft /> Back to Details
                </button>
                {event && (
                    <div className="header-event-info">
                        <h2>{event.name}</h2>
                        <span className="info-badge">
                            <FaMap /> Interactive Explorer
                        </span>
                    </div>
                )}
            </div>
            
            <div className="full-map-canvas">
                <VenueMap eventId={id} fullView={true} />
            </div>
        </div>
    );
};

export default EventMap;
