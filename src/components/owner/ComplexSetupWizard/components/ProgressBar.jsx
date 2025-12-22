import { FaCheck } from 'react-icons/fa';

const ProgressBar = ({ currentStep }) => {
  const steps = ['Thông tin cụm sân', 'Thiết lập sân', 'Khung giờ', 'Xác nhận'];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex-1 flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 
                ${
                  currentStep === step
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : currentStep > step
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
            >
              {currentStep > step ? <FaCheck /> : step}
            </div>
            {step < 4 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  currentStep > step ? 'bg-green-600' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2">
        {steps.map((label, index) => (
          <span key={index} className="text-sm text-gray-600">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
