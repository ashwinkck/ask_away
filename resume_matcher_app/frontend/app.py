import streamlit as st
import requests

st.title("🤖 Resume Matcher (AI-Powered)")

st.markdown("Upload your resume and paste the job description to see the match score and suggestions.")

resume_file = st.file_uploader("📄 Upload Resume (PDF)", type=["pdf"])
jd_text = st.text_area("📋 Paste Job Description")

if st.button("🔍 Match Now"):
    if resume_file and jd_text:
        files = {"resume": resume_file}
        data = {"jd": jd_text}

        try:
            response = requests.post("http://localhost:5000/upload", files=files, data=data)
            if response.status_code == 200:
                result = response.json()["result"]
                st.success("✅ Matching Complete")
                st.markdown(result)
            else:
                st.error(f"❌ Error from backend: {response.status_code}")
        except Exception as e:
            st.error(f"⚠️ Could not connect to backend: {e}")
    else:
        st.warning("Please upload a resume and paste a job description.")
