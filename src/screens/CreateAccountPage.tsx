import React, { useState } from 'react';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className = '', ...props }, ref) => (
  <input
    ref={ref}
    className={`w-full px-4 py-3 rounded-xl bg-white border border-gray-200 shadow-sm placeholder-gray-400 text-base focus:outline-none focus:ring-2 focus:ring-sky-300 mb-4 ${className}`}
    {...props}
  />
));
Input.displayName = 'Input';

const visaTypes = ['H2B', 'J1', 'H1B', 'F1'];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CreateAccountPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    visaType: '',
    location: '',
    employer: '',
    job: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.firstName.trim()) newErrors.firstName = 'First name is required.';
    if (!form.lastName.trim()) newErrors.lastName = 'Last name is required.';
    if (!form.email.trim()) newErrors.email = 'Email is required.';
    else if (!emailRegex.test(form.email))
      newErrors.email = 'Invalid email address.';
    if (!form.password) newErrors.password = 'Password is required.';
    else if (form.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters.';
    if (!form.confirmPassword)
      newErrors.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match.';
    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.visaType) newErrors.visaType = 'Visa type is required.';
    if (!form.location.trim()) newErrors.location = 'Location is required.';
    return newErrors;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setApiError('');
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateStep1();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateStep2();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    setApiError('');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          location: form.location,
          visaType: form.visaType,
          employer: form.employer,
          job: form.job,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Store user data and token (you might want to use a state management solution)
      localStorage.setItem('userToken', data.token);
      localStorage.setItem('userData', JSON.stringify(data));

      // Navigate to account created page
      navigate('/account-created');
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : 'Registration failed'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-4 pt-8 pb-4">
      <div className="w-full max-w-md flex flex-col items-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-1 mt-2 text-center">
          Create Account
        </h1>
        <p className="text-gray-500 text-center text-base mb-6">
          {step === 1 ? 'General information' : 'Additional information'}
        </p>

        {apiError && (
          <div className="w-full bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <p className="text-red-600 text-sm">{apiError}</p>
          </div>
        )}

        <div className="relative w-full">
          {step === 1 ? (
            <form
              className="w-full flex flex-col transition-all duration-500 opacity-100 translate-x-0 z-10"
              onSubmit={handleContinue}
              style={{ minHeight: 340 }}
            >
              <Input
                name="firstName"
                placeholder="First name"
                value={form.firstName}
                onChange={handleChange}
                required
              />
              {errors.firstName && (
                <span className="text-red-500 text-sm mb-2">
                  {errors.firstName}
                </span>
              )}
              <Input
                name="lastName"
                placeholder="Last name"
                value={form.lastName}
                onChange={handleChange}
                required
              />
              {errors.lastName && (
                <span className="text-red-500 text-sm mb-2">
                  {errors.lastName}
                </span>
              )}
              <Input
                name="email"
                placeholder="Email address"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
              {errors.email && (
                <span className="text-red-500 text-sm mb-2">
                  {errors.email}
                </span>
              )}
              <Input
                name="password"
                placeholder="Password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
              />
              {errors.password && (
                <span className="text-red-500 text-sm mb-2">
                  {errors.password}
                </span>
              )}
              <Input
                name="confirmPassword"
                placeholder="Confirm password"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
              {errors.confirmPassword && (
                <span className="text-red-500 text-sm mb-2">
                  {errors.confirmPassword}
                </span>
              )}
              <div className="mt-8">
                <Button type="submit" variant="primary">
                  Continue
                </Button>
              </div>
            </form>
          ) : (
            <form
              className="w-full flex flex-col transition-all duration-500 opacity-100 translate-x-0 z-10"
              onSubmit={handleSubmit}
              style={{ minHeight: 340 }}
            >
              <div className="relative mb-4">
                <select
                  name="visaType"
                  value={form.visaType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-sky-300 appearance-none"
                >
                  <option value="" disabled>
                    Current Visa Type (e.g. H2B, J1, H1B, F1)
                  </option>
                  {visaTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  ▲
                </span>
                {errors.visaType && (
                  <span className="text-red-500 text-sm block mt-2">
                    {errors.visaType}
                  </span>
                )}
              </div>
              <Input
                name="location"
                placeholder="Location: City, state"
                value={form.location}
                onChange={handleChange}
                required
              />
              {errors.location && (
                <span className="text-red-500 text-sm mb-2">
                  {errors.location}
                </span>
              )}
              <Input
                name="employer"
                placeholder="Current company/employer (optional)"
                value={form.employer}
                onChange={handleChange}
              />
              <Input
                name="job"
                placeholder="Current job position (optional)"
                value={form.job}
                onChange={handleChange}
              />
              <div className="mt-8">
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? 'Creating Account...' : 'Submit'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateAccountPage;
