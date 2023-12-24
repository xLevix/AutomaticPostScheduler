import React, { useState, useEffect } from 'react';
import { SegmentedControl, Select, List } from '@mantine/core';
import axios from 'axios';

export function Trending() {
    const [provider, setProvider] = useState('linkedin');
    const [country, setCountry] = useState('worldwide');
    const [tags, setTags] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const providerOptions = [
        { label: 'LinkedIn', value: 'linkedin' },
        { label: 'Instagram', value: 'instagram' },
        { label: 'Twitter', value: 'twitter' },
        { label: 'Google Trends', value: 'google' }
    ];

    const countryOptions = {
        twitter: [
            { label: 'Worldwide', value: 'worldwide' },
            { label: 'United States', value: 'united-states' },
            { label: 'Poland', value: 'poland' },
            { label: 'Germany', value: 'germany' },
            { label: 'United Kingdom', value: 'united-kingdom' },
            { label: 'Spain', value: 'spain' },
            { label: 'Turkey', value: 'turkey' },
            { label: 'Russia', value: 'russia' },
            { label: 'Japan', value: 'japan' },
        ],
        instagram: [
            { label: 'United States', value: 'us' },
            { label: 'Poland', value: 'pl' },
            { label: 'United Kingdom', value: 'gb' },
            { label: 'Germany', value: 'de' },
            { label: 'Spain', value: 'es' },
            { label: 'Russia', value: 'ru' },
            { label: 'Turkey', value: 'tr' },
            { label: 'Japan', value: 'jp' },
        ],
        linkedin: [
            { label: 'Worldwide', value: 'worldwide' }
        ],
        google: [
            { label: 'United States', value: 'US' },
            { label: 'Poland', value: 'PL' },
            { label: 'United Kingdom', value: 'GB' },
            { label: 'Germany', value: 'DE' },
            { label: 'Spain', value: 'ES' },
            { label: 'Russia', value: 'RU' },
            { label: 'Turkey', value: 'TR' },
            { label: 'Japan', value: 'JP' },
        ]
    };

    useEffect(() => {
        async function fetchTags() {
            setIsLoading(true);
            const apiProvider = provider === 'Google Trends' ? 'google' : provider.toLowerCase();

            try {
                const response = await axios.get('/api/trending/scrapDB', {
                    params: { provider: apiProvider, country: countryOptions[apiProvider].find(c => c.label === country)?.value }
                });
                setTags(response.data.data[0].tags);
            } catch (error) {
                console.error('Error fetching tags:', error);
            }
            setIsLoading(false);
        }

        fetchTags();
    }, [provider, country]);

    useEffect(() => {
        if (provider === 'linkedin') {
            setCountry('Worldwide');
        } else {
            setCountry(countryOptions[provider.toLowerCase()][0].label);
        }
    }, [provider]);

    return (
        <div>
            <SegmentedControl
                data={providerOptions.map(option => option.label)}
                value={provider}
                onChange={value => setProvider(value.toLowerCase())}
            />

            <Select
                label="Pick a country"
                placeholder="Pick a country"
                value={country}
                onChange={setCountry}
                disabled={provider === 'linkedin'}
                data={countryOptions[provider.toLowerCase()].map(option => option.label)}
            />

            {isLoading ? <p>Loading...</p> : (
                <List>
                    {tags.map((tag, index) => (
                        <List.Item key={index}>{tag}</List.Item>
                    ))}
                </List>
            )}
        </div>
    );
}

export default Trending;
