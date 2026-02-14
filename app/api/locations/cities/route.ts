import { NextResponse } from 'next/server';
import { City, State } from 'country-state-city';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        let stateCode = searchParams.get('stateId');
        const stateName = searchParams.get('stateName');

        // If stateName is provided, find the code
        // We prioritize stateCode if provided, but if it's not a valid 2-letter code, we might check name?
        // Let's assume strict usage: stateId = ISO code, stateName = Full Name.

        if (!stateCode && stateName) {
            const allStates = State.getStatesOfCountry('US');
            const foundState = allStates.find(s => s.name.toLowerCase() === stateName.toLowerCase());
            if (foundState) {
                stateCode = foundState.isoCode;
            }
        }

        if (!stateCode) {
            return NextResponse.json([]);
        }

        const cities = City.getCitiesOfState('US', stateCode);

        // Map to format expected by frontend: { id: name, name: name }
        const formattedCities = cities.map(city => ({
            id: city.name,
            name: city.name
        }));

        return NextResponse.json(formattedCities);
    } catch (error) {
        console.error('Failed to fetch cities:', error);
        return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 });
    }
}
