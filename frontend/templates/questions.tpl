<h1><i class="fa fa-question-circle"></i>Frequently Asked Questions</h1>

<div class="content">
	<ol>
		<li>
			<h3>Question:</h3>
			<p>Why can't I see myself when I use my personal website URL as input? </p>
			<h3>Answer:</h3>
			<p>Our search system analyzes the text content of the URL you provide, attempting to semantically match it with publications in the UW-Madison community. It then returns a list of authors with the most relevant publications to your website's content within UW-Madison. The results focus on well-published individuals at UW-Madison who share similar research interests with you. If you want to find your own profile, you should consider using the search by name function. </p>
		</li>

		<li>
			<h3>Question: </h3>
			<p>How does the system work?</p>
			<h3>Answer:</h3>
			<p>This system gathers publications from UW-Madison faculty using the Academic Analytics API. We then use OpenAI's embeddings to convert the titles and abstracts into vector form. When you search, your query is compared to these vectors to find relevant publications. The results are aggregated and re-ranked by author, showing you the most relevant experts. For more on the tech we use:
			<ul>
				<li>
					<a href="https://wisc.discovery.academicanalytics.com/dashboard" target="_blank">Academic Analytics</a>
				</li>
				<li>
					<a href="https://platform.openai.com/docs/models/embeddings" target="_blank">OpenAI Embeddings</a>
				</li>
				<li>
					<a href="https://milvus.io" target="_blank">Milvus Database</a>
				</li>
				<li>
					<a href="https://github.com/UW-Madison-DSI/faculty-search" target="_blank">Our GitHub Repository</a>
				</li>
			</ul>
		</li>
	</ol>
</div>