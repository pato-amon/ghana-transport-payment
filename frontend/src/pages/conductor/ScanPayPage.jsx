// frontend/src/pages/conductor/ScanPayPage.jsx
import React from 'react';
const ScanPayPage = () => (
    <div className="pb-24 bg-gray-50 min-h-screen">
        <div className="bg-white px-5 pt-14 pb-4 border-b">
            <h1 className="font-display font-bold text-xl">Collect Fare</h1>
        </div>
        <div className="px-5 py-10 text-center">
            <p className="text-4xl mb-3">📷</p>
            <p className="font-bold text-gray-900">QR Scanner</p>
            <p className="text-gray-500 text-sm">Scan passenger QR to collect fare</p>
        </div>
    </div>
);
export default ScanPayPage;

// frontend/src/pages/conductor/ManifestPage.jsx
const ManifestPage = () => (
    <div className="pb-24 bg-gray-50 min-h-screen">
        <div className="bg-white px-5 pt-14 pb-4 border-b">
            <h1 className="font-display font-bold text-xl">Trip Manifest</h1>
        </div>
        <div className="px-5 py-10 text-center">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-gray-500">Today's passenger list</p>
        </div>
    </div>
);
export { ManifestPage };

// frontend/src/pages/conductor/EarningsPage.jsx
const EarningsPage = () => (
    <div className="pb-24 bg-gray-50 min-h-screen">
        <div className="bg-white px-5 pt-14 pb-4 border-b">
            <h1 className="font-display font-bold text-xl">Earnings</h1>
        </div>
        <div className="px-5 py-10 text-center">
            <p className="text-4xl mb-3">💰</p>
            <p className="text-gray-500">Your earnings report</p>
        </div>
    </div>
);
export { EarningsPage };