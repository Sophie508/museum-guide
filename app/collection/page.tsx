"use client";

import React from 'react';
import CollectionPage from '../../components/CollectionPage';

export default function CollectionPageWrapper() {
  const handleBack = () => {
    window.history.back();
  };
  return (
    <div className="bg-gray-100 min-h-screen">
      <CollectionPage onBack={handleBack} />
    </div>
  );
}
