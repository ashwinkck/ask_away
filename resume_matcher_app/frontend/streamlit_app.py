import streamlit as st
import requests

st.set_page_config(page_title="Resume Matcher", layout="centered")

st.title("🤖 Resume Matcher (Gemini-Powered)")
st.write("Upload your resume and paste a job description to get an AI-powered match analysis.")

# Upload resume PDF
resume_file = st.file_uploader("📄 Upload Resume (PDF)", type=["pdf"])

# Input JD
jd_text = st.text_area("📝 Job Description", height=200)

# Submit
if st.button("🔍 Match Resume") and resume_file and jd_text:
    with st.spinner("Matching..."):
        # Send to Flask backend
        files = {"resume": resume_file}
        data = {"jd": jd_text}
        try:
            response = requests.post("http://localhost:5000/upload", files=files, data=data)
            if response.status_code == 200:
                result = response.json()["result"]
                st.success("🎯 Match Results:")
                st.markdown(f"```\n{result}\n```")
            else:
                st.error("⚠️ Something went wrong with the backend.")
        except Exception as e:
            st.error(f"🚫 Error connecting to backend: {e}")
else:
    st.info("Upload a PDF and enter a job description to get started.")

