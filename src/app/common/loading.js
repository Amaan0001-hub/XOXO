import Image from "next/image";
import React from 'react';

const Loading = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <Image src="https://imagedelivery.net/nq9qT5FHZv9Sg48UUnD1-A/a6abdeac-6cda-485e-7216-ca552a6f8e00/public" alt="Loading..." width={50} height={50} />
    </div>
  );
};

export default Loading;