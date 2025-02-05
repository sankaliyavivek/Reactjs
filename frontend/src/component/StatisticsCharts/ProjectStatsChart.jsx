import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ProjectStatsChart = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:8000/statistics/project-stats')
            .then(response => setStats(response.data))
            .catch(error => console.error('Error fetching project statistics:', error));
    }, []);

    if (!stats) return <p>Loading...</p>;

    const data = {
        labels: ['Total Projects', 'Started Projects', 'Overdue Projects'],
        datasets: [{
            label: 'Projects',
            data: [stats.totalProjects, stats.startedProjects, stats.overdueProjects],
            backgroundColor: ['#36A2EB', '#4CAF50', '#FF5733']
        }]
    };

    return (
        <div>
            <h2>Project Statistics</h2>
            <Bar data={data} />
        </div>
    );
};

export default ProjectStatsChart;
