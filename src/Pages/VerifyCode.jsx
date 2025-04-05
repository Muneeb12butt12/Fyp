import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const VerifyCode = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '']);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      navigate('/forgot-password');
    }
  }, [location, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e, index) => {
    const value = e.target.value;
    
    // Corrected regex test with proper closing parenthesis
    if (/^\d*$/.test(value)) {  // <-- Fixed this line
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Auto-focus next input if current input has value
      if (value && index < 3) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
      
      // Auto submit if all fields are filled
      if (newCode.every(digit => digit !== '') && index === 3) {
        handleSubmit(e);
      }
    }
  };

  const handleKeyDown = (e, index) => {
    // Handle backspace to move to previous input
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.some(digit => digit === '')) {
      setError('Please enter the complete code');
      return;
    }

    try {
      // Simulate API verification
      const verificationCode = code.join('');
      console.log('Verifying code:', verificationCode);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/set-password', { state: { email } });
    } catch (err) {
      setError('Invalid verification code. Please try again.');
    }
  };

  const resendCode = () => {
    setTimer(60);
    setError('');
    setCode(['', '', '', '']);
    document.getElementById('code-0')?.focus();
    console.log('Resending code to:', email);
    // Add your resend logic here
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-4">Verify Your Email</h2>
      <p className="mb-6 text-gray-600">Enter the 4-digit code sent to {email}</p>
      
      <form onSubmit={handleSubmit}>
        <div className="flex justify-between mb-6 gap-2">
          {code.map((digit, index) => (
            <input
              key={index}
              id={`code-${index}`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onFocus={(e) => e.target.select()}
              className="w-16 h-16 text-3xl text-center border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus={index === 0}
              required
            />
          ))}
        </div>
        
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition mb-4"
        >
          Verify Code
        </button>
        
        <div className="text-center">
          {timer > 0 ? (
            <p className="text-gray-500">Resend code in {timer} seconds</p>
          ) : (
            <button
              type="button"
              onClick={resendCode}
              className="text-blue-600 hover:underline focus:outline-none"
            >
              Resend Verification Code
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default VerifyCode;