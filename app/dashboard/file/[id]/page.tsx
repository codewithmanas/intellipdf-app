import React from "react";

const ChatToFilePage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  return (
    <div>
      <h1 className="text-3xl">ChatToFilePage: {id}</h1>
    </div>
  );
};

export default ChatToFilePage;
