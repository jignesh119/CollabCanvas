import React from "react";
import Avatar from "react-avatar";

interface IClientProps {
  username: string;
}

const Client: React.FC<IClientProps> = ({ username }) => {
  return (
    <div className="client">
      <Avatar name={username} size={"50"} round="14px" />
      <span>{username}</span>
    </div>
  );
};
export default Client;
