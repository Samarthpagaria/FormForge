import { db } from "../client";
import { templates, templateCategories } from "../schema/templates";

async function seed() {
  console.log("Seeding categories...");

  // seed global categories first
  const categories = await db
    .insert(templateCategories)
    .values([
      { name: "Business", isGlobal: true, userId: null },
      { name: "Feedback", isGlobal: true, userId: null },
      { name: "Events", isGlobal: true, userId: null },
      { name: "Education", isGlobal: true, userId: null },
      { name: "Marketing", isGlobal: true, userId: null },
    ])
    .returning();

  // map category name to id
  const categoryMap = Object.fromEntries(
    categories.map((c) => [c.name, c.id])
  );

  console.log("Seeding templates...");

  await db.insert(templates).values([
    {
      name: "Contact Form",
      description: "A simple contact form for your website",
      categoryId: categoryMap["Business"],
      icon: "mail",
      isGlobal: true,
      userId: null,
      schema: {
        fields: [
          { key: "full_name", type: "text", label: "Full Name", placeholder: "John Doe", required: true },
          { key: "email", type: "email", label: "Email Address", placeholder: "john@example.com", required: true },
          { key: "phone", type: "tel", label: "Phone Number", placeholder: "+1 234 567 890", required: false },
          { key: "subject", type: "text", label: "Subject", placeholder: "How can we help?", required: true },
          { key: "message", type: "textarea", label: "Message", placeholder: "Write your message here...", required: true },
          { key: "hear_about", type: "select", label: "How did you hear about us?", required: false, options: ["Google", "Social Media", "Friend", "Other"] },
        ],
      },
    },
    {
      name: "Job Application",
      description: "Collect job applications from candidates",
      categoryId: categoryMap["Business"],
      icon: "briefcase",
      isGlobal: true,
      userId: null,
      schema: {
        fields: [
          { key: "full_name", type: "text", label: "Full Name", placeholder: "John Doe", required: true },
          { key: "email", type: "email", label: "Email Address", placeholder: "john@example.com", required: true },
          { key: "phone", type: "tel", label: "Phone Number", placeholder: "+1 234 567 890", required: true },
          { key: "position", type: "text", label: "Position Applied For", placeholder: "Software Engineer", required: true },
          { key: "experience", type: "select", label: "Years of Experience", required: true, options: ["0-1 years", "1-3 years", "3-5 years", "5-10 years", "10+ years"] },
          { key: "education", type: "select", label: "Highest Education", required: true, options: ["High School", "Bachelor's", "Master's", "PhD", "Other"] },
          { key: "skills", type: "textarea", label: "Key Skills", placeholder: "List your key skills...", required: true },
          { key: "cover_letter", type: "textarea", label: "Cover Letter", placeholder: "Write your cover letter...", required: true },
          { key: "portfolio", type: "text", label: "Portfolio/LinkedIn URL", placeholder: "https://...", required: false },
          { key: "availability", type: "date", label: "Available Start Date", required: true },
          { key: "salary", type: "text", label: "Expected Salary", placeholder: "$50,000", required: false },
          { key: "relocate", type: "radio", label: "Willing to Relocate?", required: true, options: ["Yes", "No", "Maybe"] },
        ],
      },
    },
    {
      name: "Customer Feedback",
      description: "Collect feedback from your customers",
      categoryId: categoryMap["Feedback"],
      icon: "star",
      isGlobal: true,
      userId: null,
      schema: {
        fields: [
          { key: "full_name", type: "text", label: "Full Name", placeholder: "John Doe", required: false },
          { key: "email", type: "email", label: "Email Address", placeholder: "john@example.com", required: false },
          { key: "product", type: "text", label: "Product/Service Used", placeholder: "Product name", required: true },
          { key: "rating", type: "radio", label: "Overall Rating", required: true, options: ["1 - Poor", "2 - Fair", "3 - Good", "4 - Very Good", "5 - Excellent"] },
          { key: "satisfaction", type: "select", label: "How satisfied are you?", required: true, options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"] },
          { key: "recommend", type: "radio", label: "Would you recommend us?", required: true, options: ["Yes", "No", "Maybe"] },
          { key: "best_part", type: "textarea", label: "What did you like most?", placeholder: "Tell us what you loved...", required: false },
          { key: "improve", type: "textarea", label: "What can we improve?", placeholder: "Tell us what we can do better...", required: false },
          { key: "issues", type: "checkbox", label: "Did you face any issues?", required: false, options: ["Slow performance", "Poor UI", "Missing features", "Bad support", "Pricing"] },
        ],
      },
    },
    {
      name: "Event Registration",
      description: "Register attendees for your event",
      categoryId: categoryMap["Events"],
      icon: "calendar",
      isGlobal: true,
      userId: null,
      schema: {
        fields: [
          { key: "full_name", type: "text", label: "Full Name", placeholder: "John Doe", required: true },
          { key: "email", type: "email", label: "Email Address", placeholder: "john@example.com", required: true },
          { key: "phone", type: "tel", label: "Phone Number", placeholder: "+1 234 567 890", required: true },
          { key: "organization", type: "text", label: "Organization/Company", placeholder: "Company name", required: false },
          { key: "ticket_type", type: "select", label: "Ticket Type", required: true, options: ["General Admission", "VIP", "Student", "Speaker"] },
          { key: "attendees", type: "number", label: "Number of Attendees", placeholder: "1", required: true },
          { key: "dietary", type: "select", label: "Dietary Requirements", required: false, options: ["None", "Vegetarian", "Vegan", "Gluten-Free", "Halal", "Kosher"] },
          { key: "tshirt", type: "select", label: "T-Shirt Size", required: false, options: ["XS", "S", "M", "L", "XL", "XXL"] },
          { key: "sessions", type: "checkbox", label: "Sessions to Attend", required: false, options: ["Keynote", "Workshop A", "Workshop B", "Panel Discussion", "Networking"] },
          { key: "questions", type: "textarea", label: "Questions for Speakers", placeholder: "Any questions?", required: false },
          { key: "hear_about", type: "select", label: "How did you hear about this event?", required: false, options: ["Email", "Social Media", "Friend", "Website", "Other"] },
        ],
      },
    },
    {
      name: "Student Enrollment",
      description: "Enroll students into courses or programs",
      categoryId: categoryMap["Education"],
      icon: "book",
      isGlobal: true,
      userId: null,
      schema: {
        fields: [
          { key: "full_name", type: "text", label: "Full Name", placeholder: "John Doe", required: true },
          { key: "email", type: "email", label: "Email Address", placeholder: "john@example.com", required: true },
          { key: "phone", type: "tel", label: "Phone Number", placeholder: "+1 234 567 890", required: true },
          { key: "dob", type: "date", label: "Date of Birth", required: true },
          { key: "gender", type: "radio", label: "Gender", required: true, options: ["Male", "Female", "Non-binary", "Prefer not to say"] },
          { key: "course", type: "select", label: "Course Applying For", required: true, options: ["Web Development", "Data Science", "UI/UX Design", "Digital Marketing", "Business Management"] },
          { key: "education", type: "select", label: "Current Education Level", required: true, options: ["High School", "Undergraduate", "Graduate", "Other"] },
          { key: "experience", type: "radio", label: "Prior Experience", required: true, options: ["None", "Beginner", "Intermediate", "Advanced"] },
          { key: "goal", type: "textarea", label: "Learning Goal", placeholder: "What do you want to achieve?", required: true },
          { key: "schedule", type: "select", label: "Preferred Schedule", required: true, options: ["Morning", "Afternoon", "Evening", "Weekend"] },
          { key: "payment", type: "select", label: "Payment Method", required: true, options: ["Credit Card", "Bank Transfer", "PayPal", "Cash"] },
        ],
      },
    },
    {
      name: "Newsletter Subscription",
      description: "Grow your email list with a newsletter signup form",
      categoryId: categoryMap["Marketing"],
      icon: "mail-open",
      isGlobal: true,
      userId: null,
      schema: {
        fields: [
          { key: "full_name", type: "text", label: "Full Name", placeholder: "John Doe", required: true },
          { key: "email", type: "email", label: "Email Address", placeholder: "john@example.com", required: true },
          { key: "interests", type: "checkbox", label: "Topics of Interest", required: false, options: ["Technology", "Business", "Design", "Marketing", "Finance", "Health", "Education"] },
          { key: "frequency", type: "radio", label: "Preferred Email Frequency", required: true, options: ["Daily", "Weekly", "Bi-Weekly", "Monthly"] },
          { key: "format", type: "radio", label: "Preferred Content Format", required: false, options: ["Newsletter", "Blog Posts", "Videos", "Podcasts", "All of the above"] },
          { key: "occupation", type: "select", label: "Your Occupation", required: false, options: ["Student", "Developer", "Designer", "Manager", "Entrepreneur", "Other"] },
          { key: "age_group", type: "select", label: "Age Group", required: false, options: ["Under 18", "18-24", "25-34", "35-44", "45-54", "55+"] },
          { key: "consent", type: "checkbox", label: "I agree to receive emails", required: true, options: ["Yes, I agree to receive newsletters and updates"] },
        ],
      },
    },
    {
      name: "Product Feedback",
      description: "Collect detailed feedback on your product",
      categoryId: categoryMap["Feedback"],
      icon: "message-square",
      isGlobal: true,
      userId: null,
      schema: {
        fields: [
          { key: "full_name", type: "text", label: "Full Name", placeholder: "John Doe", required: false },
          { key: "email", type: "email", label: "Email Address", placeholder: "john@example.com", required: false },
          { key: "product_name", type: "text", label: "Product Name", placeholder: "Product you used", required: true },
          { key: "usage_duration", type: "select", label: "How long have you used this product?", required: true, options: ["Less than a week", "1-4 weeks", "1-3 months", "3-6 months", "6+ months"] },
          { key: "overall_rating", type: "radio", label: "Overall Rating", required: true, options: ["1 - Very Poor", "2 - Poor", "3 - Average", "4 - Good", "5 - Excellent"] },
          { key: "ease_of_use", type: "radio", label: "Ease of Use", required: true, options: ["Very Difficult", "Difficult", "Neutral", "Easy", "Very Easy"] },
          { key: "features_rating", type: "radio", label: "Features & Functionality", required: true, options: ["1 - Very Poor", "2 - Poor", "3 - Average", "4 - Good", "5 - Excellent"] },
          { key: "value_rating", type: "radio", label: "Value for Money", required: true, options: ["1 - Very Poor", "2 - Poor", "3 - Average", "4 - Good", "5 - Excellent"] },
          { key: "liked_features", type: "checkbox", label: "Features you liked", required: false, options: ["UI/UX", "Performance", "Reliability", "Customer Support", "Pricing", "Integrations"] },
          { key: "missing_features", type: "textarea", label: "What features are missing?", placeholder: "Tell us what you'd like to see...", required: false },
          { key: "biggest_problem", type: "textarea", label: "What is your biggest problem with the product?", placeholder: "Describe the issue...", required: false },
          { key: "recommend", type: "radio", label: "Would you recommend this product?", required: true, options: ["Definitely", "Probably", "Not Sure", "Probably Not", "Definitely Not"] },
          { key: "improvement", type: "textarea", label: "What would make this product better?", placeholder: "Share your suggestions...", required: false },
        ],
      },
    },
  ]);

  console.log("Done!");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});