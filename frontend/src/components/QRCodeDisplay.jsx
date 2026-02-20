import QRCode from 'qrcode.react';

export default function QRCodeDisplay({ qrCodeData, entryId, onDownload }) {
    const qrRef = React.useRef();

    const handleDownload = () => {
        const canvas = qrRef.current.querySelector('canvas');
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `fila-${entryId}.png`;
        link.click();
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Seu QR Code de Acompanhamento
            </h3>

            <div className='flex justify-center mb-6' ref={qrRef}>
                <div className='bg-white p-4 rounded-lg border-2 border-blue-500'>
                    <QRCode 
                        value={`${import.meta.env.VITE_FRONTEND_URL}/tracking/${entryId}`}
                        level="H"
                        size={256}
                        includeMargin={true}
                    />
                </div>
            </div>

        </div>
    )

}