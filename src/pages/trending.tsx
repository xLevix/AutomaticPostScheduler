import React, { useState, useEffect } from 'react';
import {SegmentedControl, Select, Container, Table, Space} from '@mantine/core';
import axios from 'axios';
import {useSession} from "next-auth/react";
import {useRouter} from "next/router";

export function Trending() {
    const [provider, setProvider] = useState('linkedin');
    const [country, setCountry] = useState('worldwide');
    const [tags, setTags] = useState([]);
    const [providerUrl, setProviderUrl] = useState('');
    const { data: session, status } = useSession()
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/api/auth/signin');
        }
    }, [status]);

    const providerOptions = [
        { label: 'LinkedIn', value: 'linkedin', url: 'https://taplio.com/trending' },
        { label: 'Instagram', value: 'instagram', url: 'https://displaypurposes.com/hashtags/rank/best/country' },
        { label: 'Twitter', value: 'twitter', url: 'RapidAPI Twitter Trends' },
        { label: 'Google Trends', value: 'google', url: 'RapidAPI Trendly (Google Trends)' },
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
            { label: 'United States', value: 'United States' },
            { label: 'Poland', value: 'Poland' },
            { label: 'United Kingdom', value: 'United Kingdom' },
            { label: 'Germany', value: 'Germany' },
            { label: 'Spain', value: 'Spain' },
            { label: 'Russia', value: 'Russia' },
            { label: 'Turkey', value: 'Turkey' },
            { label: 'Japan', value: 'Japan' },
        ]
    };

    const tagRows = tags.map((tag, index) => (
        <tr key={index}>
            <td>{index + 1}</td>
            <td>{tag}</td>
        </tr>
    ));

    useEffect(() => {
        async function fetchTags() {
            const apiProvider = provider.toLowerCase();
            try {
                const params = { provider: apiProvider };
                if (apiProvider !== 'linkedin') {
                    params['country'] = countryOptions[provider].find(c => c.label === country)?.value;
                }
                const response = await axios.get('/api/trending/scrapDB', { params });
                if (Array.isArray(response.data.data)) {
                    setTags(response.data.data);
                } else {
                    console.error('Unexpected data format:', response.data.data);
                    setTags([]);
                }
            } catch (error) {
                console.error('Error fetching tags:', error);
            }
        }

        fetchTags();
    }, [provider, country]);

    useEffect(() => {
        const defaultCountryOptions = countryOptions[provider.toLowerCase()];
        if (provider === 'linkedin') {
            setCountry('Worldwide');
        } else if (defaultCountryOptions && defaultCountryOptions.length > 0) {
            setCountry(defaultCountryOptions[0].label);
        }
        const selectedProvider = providerOptions.find(option => option.value === provider);
        if (selectedProvider) {
            setProviderUrl(selectedProvider.url);
        }
    }, [provider]);

    const currentCountryOptions = countryOptions[provider.toLowerCase()] || [];

    return (
        <Container>
            <div>
                <SegmentedControl
                    data={providerOptions.map(option => option.label)}
                    value={providerOptions.find(option => option.value === provider)?.label}
                    onChange={label => {
                        const selectedOption = providerOptions.find(option => option.label === label);
                        if (selectedOption) {
                            setProvider(selectedOption.value);
                        }
                    }}
                />
                <Space h="xl"/>
                <Select
                    label="Pick a country"
                    placeholder="Pick a country"
                    value={country}
                    onChange={setCountry}
                    disabled={provider === 'linkedin'}
                    data={currentCountryOptions.map(option => option.label)}
                />
                <Space h="xl"/>
                <p>Data sourced from: <a href={providerUrl} target="_blank" rel="noopener noreferrer">{providerUrl}</a>
                </p>

                <Table>
                    <thead>
                    <tr>
                        <th>Number sorted by popularity</th>
                        <th>Tag</th>
                    </tr>
                    </thead>
                    <tbody>{tagRows}</tbody>
                </Table>

            </div>
        </Container>
    );
}

export default Trending;
