type Props = {
  success?: string;
  error?: string;
};

export function FlashMessage({ success, error }: Props) {
  if (!success && !error) {
    return null;
  }

  if (error) {
    return <p className="message message-error">{error}</p>;
  }

  return <p className="message message-success">{success}</p>;
}
